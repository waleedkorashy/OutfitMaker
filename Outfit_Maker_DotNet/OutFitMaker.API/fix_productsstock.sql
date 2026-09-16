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
        CONSTRAINT [FK_ProductsStock_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Main].[Products] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProductsStock_Sizes_SizeId] FOREIGN KEY ([SizeId]) REFERENCES [Main].[Sizes] ([Id]) ON DELETE NO ACTION
    );
    CREATE INDEX [IX_ProductsStock_ProductId] ON [Main].[ProductsStock] ([ProductId]);
    CREATE INDEX [IX_ProductsStock_SizeId] ON [Main].[ProductsStock] ([SizeId]);
END