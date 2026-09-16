using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using OutFitMaker.API.Utilities;
using OutFitMaker.Domain.Constants.Enums;
using OutFitMaker.Domain.DTOs.Operation;
using OutFitMaker.Domain.Interfaces.Operation;
using OutFitMaker.Services.IServices.Security;
using System.Net.Http;
using System.Text;

namespace OutFitMaker.API.Controllers.Operation
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        #region Properties and constructors
        private readonly IOrderServices _orderServices;
        private readonly IUserRepo _userRepo;
        private readonly HttpClient _httpClient;
        private readonly AiApiOptions _aiOptions;

        public OrderController(IOrderServices orderServices,
            IUserRepo userRepo,
            IHttpClientFactory httpClientFactory,
            IOptions<AiApiOptions> aiOptions)
        {
            _orderServices = orderServices;
            _userRepo = userRepo;
            _httpClient = httpClientFactory.CreateClient();
            _aiOptions = aiOptions.Value;
        }
        #endregion

        [HttpPost("predict")]
        [AllowAnonymous]
        public async Task<IActionResult> Predict([FromBody] dynamic inputData)
        {
            try
            {
                if (inputData.ValueKind == System.Text.Json.JsonValueKind.Undefined)
                {
                    return BadRequest("No input data provided.");
                }

                using var content = new StringContent(inputData.ToString(), Encoding.UTF8, "application/json");
                using var response = await _httpClient.PostAsync(_aiOptions.PredictionUrl, content);

                var responseBody = await response.Content.ReadAsStringAsync();
                return Content(responseBody, "application/json");
            }
            catch (HttpRequestException)
            {
                return StatusCode(503, new { message = "The AI size service is not reachable. Please make sure it is running on port 5000." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while contacting the AI size service.", error = ex.Message });
            }
        }

        [HttpPost("recommend")]
        [AllowAnonymous]
        public async Task<IActionResult> Recommend([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                using var requestContent = new MultipartFormDataContent();
                var fileContent = new ByteArrayContent(stream.ToArray());
                fileContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data")
                {
                    Name = "file",
                    FileName = file.FileName
                };
                fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                requestContent.Add(fileContent);

                using var response = await _httpClient.PostAsync(_aiOptions.RecommendationUrl, requestContent);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode,
                        new { message = "Failed to upload file to the recommendation service.", serverBResponse = await response.Content.ReadAsStringAsync() });
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                JObject jsonResponse = JObject.Parse(responseBody);
                var recommendedImages = jsonResponse["recommended_images"];

                if (recommendedImages == null)
                {
                    return BadRequest("Invalid response from recommendation service.");
                }

                var recommendedImageUrls = recommendedImages.ToObject<List<string>>();
                if (recommendedImageUrls is null || recommendedImageUrls.Count == 0)
                {
                    return Ok(new { message = "File uploaded successfully but no recommendations found.", products = new List<object>() });
                }

                return Ok(await _orderServices.GetRecommendedProducts(recommendedImageUrls));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your request.", error = ex.Message });
            }
        }

        [HttpPost]
        [Route("[action]")]
        [Authorize(Roles = nameof(RolesEnum.Customer))]
        public async Task<IActionResult> AddOrder(AddOrderDto dto)
        {
            var response = await _orderServices.AddOrderAsync(dto);
            return Ok(response);
        }

        [HttpPost]
        [Route("[action]/{ProductId}")]
        [Authorize(Roles = nameof(RolesEnum.Customer))]
        public async Task<IActionResult> AddFavouriteProduct(Guid ProductId) =>
           Ok(await _orderServices.AddFavouriteProduct(ProductId, false));

        [HttpDelete]
        [Route("[action]/{ProductId}")]
        [Authorize(Roles = nameof(RolesEnum.Customer))]
        public async Task<IActionResult> DeleteFavouriteProduct(Guid ProductId) =>
           Ok(await _orderServices.AddFavouriteProduct(ProductId, true));

        [HttpPut]
        [Route("[action]/{OrderId}")]
        [Authorize(Roles = nameof(RolesEnum.Customer))]
        public async Task<IActionResult> ConfirmOrder(Guid OrderId) =>
            Ok(await _orderServices.ConfirmOrder(OrderId, true));

        [HttpGet]
        [Route("[action]")]
        [Authorize(Roles = nameof(RolesEnum.Customer))]
        public async Task<IActionResult> GetFavouriteProducts() =>
            Ok(await _orderServices.GetFavouriteProducts());

        [HttpGet]
        [Route("[action]")]
        [Authorize(Roles = nameof(RolesEnum.Customer))]
        public async Task<IActionResult> GetMyOrders() =>
            Ok(await _orderServices.GetMyOrders());

        [HttpGet]
        [Route("[action]")]
        public async Task<IActionResult> GetBestSellerProducts() =>
            Ok(await _orderServices.GetBestSellerProducts());

        [HttpGet]
        [Route("[action]")]
        public async Task<IActionResult> GetMaleProducts() =>
            Ok(await _orderServices.GetGenderProducts(true));

        [HttpGet]
        [Route("[action]")]
        public async Task<IActionResult> GetFemaleProducts() =>
            Ok(await _orderServices.GetGenderProducts(false));

        [HttpGet]
        [Route("[action]/{CategoryId}")]
        public async Task<IActionResult> GetMaleProductsWithCategory(Guid CategoryId) =>
           Ok(await _orderServices.GetGenderProductsWithCategory(CategoryId, true));

        [HttpGet]
        [Route("[action]/{CategoryId}")]
        public async Task<IActionResult> GetFemaleProductsWithCategory(Guid CategoryId) =>
           Ok(await _orderServices.GetGenderProductsWithCategory(CategoryId, false));

        [HttpGet]
        [Route("[action]")]
        public async Task<IActionResult> GetUniqueProducts([FromQuery] GetUniqueProductsDto dto) =>
           Ok(await _orderServices.GetUniqueProducts(dto));

        [HttpGet]
        [Route("[action]/{ProductId}")]
        public async Task<IActionResult> GetProductById(Guid ProductId) =>
            Ok(await _orderServices.GetProductById(ProductId));

        [HttpGet]
        [Route("[action]/{SizeName}")]
        public async Task<IActionResult> GetProductsBySize(string SizeName) =>
            Ok(await _orderServices.GetProductsBySize(SizeName));

        [HttpGet]
        [Route("[action]/{OrderId}")]
        public async Task<IActionResult> GetOrderDetails(Guid OrderId) =>
          Ok(await _orderServices.GetOrderDetails(OrderId));
    }
}