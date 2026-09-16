using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OutFitMaker.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStockTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Guard with IF NOT EXISTS so the migration is safe on databases
            // where the table was already created via raw SQL (local dev).
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'Main.ProductsStock', N'U') IS NULL
BEGIN
    CREATE TABLE [Main].[ProductsStock] (
        [Id] uniqueidentifier NOT NULL,
        [Quantity] int NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [SizeId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_ProductsStock] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductsStock_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Main].[Products] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ProductsStock_Sizes_SizeId] FOREIGN KEY ([SizeId]) REFERENCES [Main].[Sizes] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_ProductsStock_ProductId] ON [Main].[ProductsStock] ([ProductId]);
    CREATE INDEX [IX_ProductsStock_SizeId] ON [Main].[ProductsStock] ([SizeId]);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductsStock",
                schema: "Main");
        }
    }
}
