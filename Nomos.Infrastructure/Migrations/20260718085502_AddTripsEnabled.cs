using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nomos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripsEnabled : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "TripsEnabled",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TripsEnabled",
                table: "Users");
        }
    }
}
