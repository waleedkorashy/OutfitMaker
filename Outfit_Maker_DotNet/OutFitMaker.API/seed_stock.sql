-- Re-seed ProductsStock to include the new XXS size.
DELETE FROM Main.ProductsStock;

DECLARE @sizes TABLE (SizeId uniqueidentifier, RowNum int);
INSERT INTO @sizes (SizeId, RowNum)
SELECT Id, ROW_NUMBER() OVER (ORDER BY Name) - 1 FROM Main.Sizes WHERE IsDeleted = 0;

DECLARE @prods TABLE (ProductId uniqueidentifier, Name nvarchar(255));
INSERT INTO @prods (ProductId, Name)
SELECT Id, Name FROM Main.Products WHERE IsDeleted = 0;

INSERT INTO Main.ProductsStock (Id, ProductId, SizeId, Quantity, IsDeleted, CreationDate, LastUpdatedDate)
SELECT NEWID(),
       p.ProductId,
       s.SizeId,
       CASE WHEN (ABS(CHECKSUM(p.Name)) + s.RowNum) % 4 = 0 THEN 0
            ELSE 3 + ((ABS(CHECKSUM(p.Name)) + s.RowNum * 7) % 38)
       END AS Quantity,
       0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
FROM @prods p
CROSS JOIN @sizes s;

SELECT COUNT(*) AS RowsTotal FROM Main.ProductsStock;
SELECT sz.Name, COUNT(*) AS Products
FROM Main.ProductsStock ps JOIN Main.Sizes sz ON sz.Id = ps.SizeId
WHERE ps.IsDeleted = 0
GROUP BY sz.Name ORDER BY sz.Name;