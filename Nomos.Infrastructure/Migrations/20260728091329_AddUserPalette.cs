using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nomos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPalette : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Palette",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Palette",
                table: "Users");
        }
    }
}
