using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Spiccioli.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueCategoryPerBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BudgetAllocations_MonthlyBudgetId",
                table: "BudgetAllocations");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAllocations_MonthlyBudgetId_CategoryId",
                table: "BudgetAllocations",
                columns: new[] { "MonthlyBudgetId", "CategoryId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BudgetAllocations_MonthlyBudgetId_CategoryId",
                table: "BudgetAllocations");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAllocations_MonthlyBudgetId",
                table: "BudgetAllocations",
                column: "MonthlyBudgetId");
        }
    }
}
