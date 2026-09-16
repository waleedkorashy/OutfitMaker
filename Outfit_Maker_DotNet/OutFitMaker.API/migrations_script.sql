IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    IF SCHEMA_ID(N'Main') IS NULL EXEC(N'CREATE SCHEMA [Main];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    IF SCHEMA_ID(N'Security') IS NULL EXEC(N'CREATE SCHEMA [Security];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Main].[Categories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Security].[Roles] (
        [Id] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        [Name] nvarchar(25) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Security].[Users] (
        [Id] uniqueidentifier NOT NULL,
        [UserName] varchar(25) NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        [Name] nvarchar(50) NULL,
        [PasswordVerificationCode] nvarchar(6) NULL,
        [PasswordConfirmed] bit NOT NULL,
        [TempEmail] nvarchar(50) NULL,
        [IsBanned] bit NOT NULL,
        [BanReason] nvarchar(max) NULL,
        [NormalizedUserName] varchar(25) NULL,
        [Email] nvarchar(50) NULL,
        [NormalizedEmail] nvarchar(50) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(15) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Main].[Products] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Price] float NOT NULL,
        [IsAvailable] bit NOT NULL,
        [IsOffer] bit NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Main].[Categories] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Security].[UsersRoles] (
        [UserId] uniqueidentifier NOT NULL,
        [RoleId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_UsersRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_UsersRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Security].[Roles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UsersRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Security].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Main].[ProductColors] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [ImageUrl] nvarchar(max) NULL,
        [IsAvailable] bit NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_ProductColors] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductColors_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Main].[Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Main].[ProductSizes] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [IsAvailable] bit NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_ProductSizes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductSizes_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Main].[Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE TABLE [Main].[ProductSizesWithColors] (
        [Id] uniqueidentifier NOT NULL,
        [IsAvailable] bit NOT NULL,
        [ProductColorId] uniqueidentifier NOT NULL,
        [ProductSizeId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_ProductSizesWithColors] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductSizesWithColors_ProductColors_ProductColorId] FOREIGN KEY ([ProductColorId]) REFERENCES [Main].[ProductColors] ([Id]),
        CONSTRAINT [FK_ProductSizesWithColors_ProductSizes_ProductSizeId] FOREIGN KEY ([ProductSizeId]) REFERENCES [Main].[ProductSizes] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [IX_ProductColors_ProductId] ON [Main].[ProductColors] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [Main].[Products] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [IX_ProductSizes_ProductId] ON [Main].[ProductSizes] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [IX_ProductSizesWithColors_ProductColorId] ON [Main].[ProductSizesWithColors] ([ProductColorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [IX_ProductSizesWithColors_ProductSizeId] ON [Main].[ProductSizesWithColors] ([ProductSizeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [Security].[Roles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [Security].[Users] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [Security].[Users] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    CREATE INDEX [IX_UsersRoles_RoleId] ON [Security].[UsersRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326114724_first'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240326114724_first', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326223216_second'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD [DateOfBirth] date NOT NULL DEFAULT '0001-01-01';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326223216_second'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD [Gender] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240326223216_second'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240326223216_second', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240327000228_third'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Security].[Users]') AND [c].[name] = N'DateOfBirth');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [Security].[Users] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [Security].[Users] DROP COLUMN [DateOfBirth];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240327000228_third'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD [EmailVerificationCode] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240327000228_third'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD [Height] float NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240327000228_third'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD [weight] float NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240327000228_third'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240327000228_third', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329212626_edit'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [OrdersCount] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329212626_edit'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240329212626_edit', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329213159_edit2'
)
BEGIN
    DECLARE @var1 nvarchar(max);
    SELECT @var1 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Security].[Users]') AND [c].[name] = N'Height');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Security].[Users] DROP CONSTRAINT ' + @var1 + ';');
    ALTER TABLE [Security].[Users] DROP COLUMN [Height];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329213159_edit2'
)
BEGIN
    DECLARE @var2 nvarchar(max);
    SELECT @var2 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Security].[Users]') AND [c].[name] = N'weight');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Security].[Users] DROP CONSTRAINT ' + @var2 + ';');
    ALTER TABLE [Security].[Users] DROP COLUMN [weight];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329213159_edit2'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD [ProductSizeId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329213159_edit2'
)
BEGIN
    CREATE INDEX [IX_Users_ProductSizeId] ON [Security].[Users] ([ProductSizeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329213159_edit2'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD CONSTRAINT [FK_Users_ProductSizes_ProductSizeId] FOREIGN KEY ([ProductSizeId]) REFERENCES [Main].[ProductSizes] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240329213159_edit2'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240329213159_edit2', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    ALTER TABLE [Security].[Users] DROP CONSTRAINT [FK_Users_ProductSizes_ProductSizeId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    EXEC sp_rename N'[Security].[Users].[ProductSizeId]', N'SizeId', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    EXEC sp_rename N'[Security].[Users].[IX_Users_ProductSizeId]', N'IX_Users_SizeId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    ALTER TABLE [Main].[ProductSizes] ADD [SizeId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    CREATE TABLE [Main].[Sizes] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Sizes] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    CREATE INDEX [IX_ProductSizes_SizeId] ON [Main].[ProductSizes] ([SizeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    ALTER TABLE [Main].[ProductSizes] ADD CONSTRAINT [FK_ProductSizes_Sizes_SizeId] FOREIGN KEY ([SizeId]) REFERENCES [Main].[Sizes] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    ALTER TABLE [Security].[Users] ADD CONSTRAINT [FK_Users_Sizes_SizeId] FOREIGN KEY ([SizeId]) REFERENCES [Main].[Sizes] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240330155507_editsizes'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240330155507_editsizes', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    DROP TABLE [Main].[ProductSizesWithColors];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    DROP TABLE [Main].[ProductColors];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    DROP TABLE [Main].[ProductSizes];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    DECLARE @var3 nvarchar(max);
    SELECT @var3 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Main].[Products]') AND [c].[name] = N'IsOffer');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Main].[Products] DROP CONSTRAINT ' + @var3 + ';');
    ALTER TABLE [Main].[Products] DROP COLUMN [IsOffer];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    IF SCHEMA_ID(N'Operation') IS NULL EXEC(N'CREATE SCHEMA [Operation];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [ColorId] uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [ImageUrl] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [ImageUrlWithLogo] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [LogoId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [Rate] float NOT NULL DEFAULT 0.0E0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [SizeId] uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Categories] ADD [Gender] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Categories] ADD [Sleeve] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE TABLE [Main].[Colors] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Colors] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE TABLE [Main].[Logos] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Logos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE TABLE [Operation].[Orders] (
        [Id] uniqueidentifier NOT NULL,
        [OrderStatus] int NOT NULL,
        [Total] float NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Security].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE TABLE [Operation].[OrdersItems] (
        [Id] uniqueidentifier NOT NULL,
        [Quentity] int NOT NULL,
        [Note] nvarchar(max) NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_OrdersItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrdersItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Operation].[Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrdersItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Main].[Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE INDEX [IX_Products_ColorId] ON [Main].[Products] ([ColorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE INDEX [IX_Products_LogoId] ON [Main].[Products] ([LogoId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE INDEX [IX_Products_SizeId] ON [Main].[Products] ([SizeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE INDEX [IX_Orders_UserId] ON [Operation].[Orders] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE INDEX [IX_OrdersItems_OrderId] ON [Operation].[OrdersItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    CREATE INDEX [IX_OrdersItems_ProductId] ON [Operation].[OrdersItems] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD CONSTRAINT [FK_Products_Colors_ColorId] FOREIGN KEY ([ColorId]) REFERENCES [Main].[Colors] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD CONSTRAINT [FK_Products_Logos_LogoId] FOREIGN KEY ([LogoId]) REFERENCES [Main].[Logos] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD CONSTRAINT [FK_Products_Sizes_SizeId] FOREIGN KEY ([SizeId]) REFERENCES [Main].[Sizes] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240417000223_addorderModule'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240417000223_addorderModule', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240424192308_addorder'
)
BEGIN
    DECLARE @var4 nvarchar(max);
    SELECT @var4 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Operation].[OrdersItems]') AND [c].[name] = N'Quentity');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Operation].[OrdersItems] DROP CONSTRAINT ' + @var4 + ';');
    ALTER TABLE [Operation].[OrdersItems] ALTER COLUMN [Quentity] float NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240424192308_addorder'
)
BEGIN
    ALTER TABLE [Operation].[OrdersItems] ADD [Price] float NOT NULL DEFAULT 0.0E0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240424192308_addorder'
)
BEGIN
    ALTER TABLE [Main].[Logos] ADD [ImageUrl] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240424192308_addorder'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240424192308_addorder', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240510080209_addfavproduct'
)
BEGIN
    CREATE TABLE [Operation].[FavoriteProducts] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreationDate] datetimeoffset NOT NULL,
        [LastUpdatedDate] datetimeoffset NOT NULL,
        CONSTRAINT [PK_FavoriteProducts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FavoriteProducts_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Main].[Products] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FavoriteProducts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Security].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240510080209_addfavproduct'
)
BEGIN
    CREATE INDEX [IX_FavoriteProducts_ProductId] ON [Operation].[FavoriteProducts] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240510080209_addfavproduct'
)
BEGIN
    CREATE INDEX [IX_FavoriteProducts_UserId] ON [Operation].[FavoriteProducts] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240510080209_addfavproduct'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240510080209_addfavproduct', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240510082917_addordernumber'
)
BEGIN
    ALTER TABLE [Operation].[Orders] ADD [OrderNumber] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240510082917_addordernumber'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240510082917_addordernumber', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210017_finaledit'
)
BEGIN
    ALTER TABLE [Main].[Products] DROP CONSTRAINT [FK_Products_Logos_LogoId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210017_finaledit'
)
BEGIN
    DROP TABLE [Main].[Logos];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210017_finaledit'
)
BEGIN
    DROP INDEX [IX_Products_LogoId] ON [Main].[Products];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210017_finaledit'
)
BEGIN
    DECLARE @var5 nvarchar(max);
    SELECT @var5 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Main].[Products]') AND [c].[name] = N'LogoId');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Main].[Products] DROP CONSTRAINT ' + @var5 + ';');
    ALTER TABLE [Main].[Products] DROP COLUMN [LogoId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210017_finaledit'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [IsUnique] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210017_finaledit'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240517210017_finaledit', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210533_finaledit2'
)
BEGIN
    DECLARE @var6 nvarchar(max);
    SELECT @var6 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Main].[Categories]') AND [c].[name] = N'Sleeve');
    IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Main].[Categories] DROP CONSTRAINT ' + @var6 + ';');
    ALTER TABLE [Main].[Categories] DROP COLUMN [Sleeve];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210533_finaledit2'
)
BEGIN
    DECLARE @var7 nvarchar(max);
    SELECT @var7 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Main].[Categories]') AND [c].[name] = N'Gender');
    IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [Main].[Categories] DROP CONSTRAINT ' + @var7 + ';');
    ALTER TABLE [Main].[Categories] ALTER COLUMN [Gender] int NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240517210533_finaledit2'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240517210533_finaledit2', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240518080139_addtype'
)
BEGIN
    ALTER TABLE [Main].[Products] ADD [Type] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20240518080139_addtype'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20240518080139_addtype', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260914175642_AddProductStockTable'
)
BEGIN

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

END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260914175642_AddProductStockTable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260914175642_AddProductStockTable', N'10.0.12');
END;

COMMIT;
GO

