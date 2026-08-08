using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pluto.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropUserInitialBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InitialBalance",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "InitialBalance",
                table: "Users",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
