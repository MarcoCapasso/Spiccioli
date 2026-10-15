using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Services;
using Spiccioli.Api.Tests.Fakes;

namespace Spiccioli.Api.Tests.Services;

public class CategoryServiceTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private readonly FakeCategoryRepository _categories = new();
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        _service = new CategoryService(_categories);
    }

    [Fact]
    public async Task RenameAsync_SameNameDifferentCase_Succeeds()
    {
        // Arrange: rinominare una categoria cambiando solo le maiuscole non è un conflitto con se stessa
        _categories.Categories.Add(new Category
        {
            Id = 1,
            Name = "Trasporti",
            Type = TransactionType.Expense,
            UserId = UserId,
        });

        // Act
        var result = await _service.RenameAsync(UserId, 1, new UpdateCategoryRequest("TRASPORTI"));

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("TRASPORTI", _categories.Categories.Single().Name);
    }
}