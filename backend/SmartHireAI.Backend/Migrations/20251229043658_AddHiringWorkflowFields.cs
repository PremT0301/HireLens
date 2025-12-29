using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHiringWorkflowFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_deleted_by_recruiter",
                table: "job_applications");

            migrationBuilder.DropColumn(
                name: "is_reapplication",
                table: "job_applications");

            migrationBuilder.AddColumn<DateTime>(
                name: "hired_at",
                table: "job_applications",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "interview_accepted_at",
                table: "job_applications",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hired_at",
                table: "job_applications");

            migrationBuilder.DropColumn(
                name: "interview_accepted_at",
                table: "job_applications");

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted_by_recruiter",
                table: "job_applications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_reapplication",
                table: "job_applications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
