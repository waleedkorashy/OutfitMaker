using OutFitMaker.DataAccess.Repositories.Base;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace OutFitMaker.Domain.Models.Main
{
    [Table("ProductsStock", Schema = "Main")]
    public class ProductStockSet : BaseEntity
    {
        #region Properties
        public int Quantity { get; set; }
        #endregion

        #region Navigation Properties
        public ProductSet Product { get; set; } = default!;
        public Guid ProductId { get; set; }

        public SizesSet Size { get; set; } = default!;
        public Guid SizeId { get; set; }
        #endregion
    }
}