USE OutFitMaker;
GO

-- Helper: normalize an image code filename into a friendly product name.
--   women_crew_short_C3_D1.png  ->  Women's Crew Neck Short Sleeve (C3 D1)
--   men_vneck_short_C5_D2.png   ->  Men's V-Neck Short Sleeve (C5 D2)
IF OBJECT_ID('dbo.NormalizeProductName', 'FN') IS NOT NULL
  DROP FUNCTION dbo.NormalizeProductName;
GO

CREATE FUNCTION dbo.NormalizeProductName(@file nvarchar(500))
RETURNS nvarchar(500)
AS
BEGIN
  DECLARE @base nvarchar(500) = REPLACE(@file, '.png', '');
  
  DECLARE @gender nvarchar(20) = CASE
    WHEN @base LIKE 'women%' THEN 'Women''s'
    WHEN @base LIKE 'men%'   THEN 'Men''s'
    ELSE ''
  END;

  DECLARE @rest nvarchar(500) = REPLACE(
    REPLACE(@base, 'women_', ''),
    'men_', '');

  DECLARE @neck nvarchar(30) = CASE
    WHEN @rest LIKE 'vneck%' THEN 'V-Neck'
    WHEN @rest LIKE 'crew%'  THEN 'Crew Neck'
    ELSE ''
  END;

  DECLARE @rest2 nvarchar(500) = REPLACE(REPLACE(@rest, 'vneck_', ''), 'crew_', '');

  DECLARE @sleeve nvarchar(30) = CASE
    WHEN @rest2 LIKE 'short%' THEN 'Short Sleeve'
    ELSE ''
  END;

  DECLARE @code nvarchar(100) = REPLACE(@rest2, 'short_', '');
  SET @code = REPLACE(@code, '_', ' ');

  DECLARE @result nvarchar(500) = LTRIM(RTRIM(
    @gender + ' ' + @neck + ' ' + @sleeve + ' (' + @code + ')'
  ));
  SET @result = REPLACE(@result, '  ', ' ');

  RETURN @result;
END;
GO

-- 1) Fix ImageUrl missing extension so product images render
UPDATE p SET p.ImageUrl = p.ImageUrl + '.png'
FROM Main.Products p
WHERE p.IsDeleted = 0
  AND p.ImageUrl IS NOT NULL
  AND p.ImageUrl NOT LIKE '%.png'
  AND p.ImageUrl NOT LIKE '%.jpg'
  AND p.ImageUrl NOT LIKE '%.jpeg';

-- 2) Derive a friendly product name from ImageUrl + Category
UPDATE p SET p.Name =
  CASE
    WHEN p.ImageUrl IS NOT NULL AND p.ImageUrl NOT LIKE 'Untitled-%' THEN
      dbo.NormalizeProductName(p.ImageUrl)
    WHEN p.ImageUrl IS NOT NULL AND p.ImageUrl LIKE 'Untitled-%' THEN
      (SELECT c.Name FROM Main.Categories c WHERE c.Id = p.CategoryId) + ' - Style '
      + SUBSTRING(REPLACE(p.ImageUrl, '.png', ''), 9, LEN(p.ImageUrl))
    ELSE p.Name
  END
FROM Main.Products p
WHERE p.IsDeleted = 0
  AND (
    p.Name LIKE 'Untitled-%'
    OR p.Name LIKE 'men_%'
    OR p.Name LIKE 'women_%'
  );

-- Verify
SET NOCOUNT ON;
SELECT Name, ImageUrl,
  (SELECT c.Name FROM Main.Categories c WHERE c.Id = p.CategoryId) AS Category
FROM Main.Products p
WHERE p.IsDeleted = 0
ORDER BY Name;
GO