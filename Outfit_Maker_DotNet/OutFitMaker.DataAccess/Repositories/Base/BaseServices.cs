using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OutFitMaker.Domain.Constants.Statics;
using OutFitMaker.Domain.Interfaces.Base;
using OutFitMaker.Domain.Models.Security;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OutFitMaker.DataAccess.Repositories.Base
{
    public class BaseServices : IBaseServices
    {
        private readonly IConfiguration _configuration;

        public BaseServices(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string DecryptQRCode(string qrCode)
        {
            char[] result = new char[50];
            string ENC = "@QnhU64!z&9#Ke84hfogueb748%H&*@DghJ!kwfJLp&@A3z%s7";
            int i = 0;
            for (; i < qrCode.Length; i++)
            {
                result[i] = (char)(qrCode[i] ^ ENC[i]);
            }
            string s = new string(result)[0..^(result.Length - i)];
            return s;
        }

        public string EncryptQRCode(string randomCode)
        {
            char[] result = new char[50];
            for (int j = 0; j < 50; j++)
            {
                result[j] = 'X';
            }
            string ENC = "@QnhU64!z&9#Ke84hfogueb748%H&*@DghJ!kwfJLp&@A3z%s7";
            int i = 0;
            for (; i < randomCode.Length; i++)
            {
                result[i] = (char)(randomCode[i] ^ ENC[i]);
            }
            string s = new string(result)[0..^(result.Length - i)];
            return s;
        }

        public async Task<string> GenerateJwt(UserSet user, string? role)
        {
            var key = _configuration["JWT:Key"] ?? GlobalStatices.JWTKey;
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, "HS256");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Role, role ?? string.Empty)
             };

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims,
                expires: DateTime.UtcNow.AddMonths(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRandomCode(int length)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            var stringChars = new char[length];

            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            return new string(stringChars);
        }

        public string GenerateRandomNumbers(int length)
        {
            var bytes = new byte[length * 4];
            using (var crypto = RandomNumberGenerator.Create())
            {
                crypto.GetBytes(bytes);
            }

            var code = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                code.Append(BitConverter.ToUInt32(bytes, i * 4) % 10);
            }
            return code.ToString();
        }

        public string GenerateValidCode(List<string> codes, int size = 10)
        {
            var code = GenerateUniqueCode(size);

            while (codes.Contains(code))
            {
                code = GenerateUniqueCode(size);
            }

            return code;
        }
        private string GenerateUniqueCode(int size)
        {
            char[] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray();

            byte[] data = new byte[4 * size];
            using (RandomNumberGenerator.Create())
            {
                RandomNumberGenerator.Fill(data);
            }
            StringBuilder result = new StringBuilder(size);
            for (int i = 0; i < size; i++)
            {
                var rnd = BitConverter.ToUInt32(data, i * 4);
                var idx = rnd % chars.Length;

                result.Append(chars[idx]);
            }

            return result.ToString();
        }
    }
}
