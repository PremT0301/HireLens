using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRecruiterSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_deleted_by_recruiter",
                table: "job_applications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_deleted_by_recruiter",
                table: "job_applications");
        }
    }
}
