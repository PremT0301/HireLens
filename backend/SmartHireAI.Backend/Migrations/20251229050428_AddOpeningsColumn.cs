using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOpeningsColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "number_of_openings",
                table: "job_descriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "number_of_openings",
                table: "job_descriptions");
        }
    }
}
