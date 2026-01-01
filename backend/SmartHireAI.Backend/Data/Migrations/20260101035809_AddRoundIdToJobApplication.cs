using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRoundIdToJobApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "interview_duration",
                table: "job_applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "interview_notes",
                table: "job_applications",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "round_id",
                table: "job_applications",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "interview_duration",
                table: "job_applications");

            migrationBuilder.DropColumn(
                name: "interview_notes",
                table: "job_applications");

            migrationBuilder.DropColumn(
                name: "round_id",
                table: "job_applications");
        }
    }
}
