using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewFieldsToJobApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "interview_date",
                table: "job_applications",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "interview_mode",
                table: "job_applications",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "meeting_link",
                table: "job_applications",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "interview_date",
                table: "job_applications");

            migrationBuilder.DropColumn(
                name: "interview_mode",
                table: "job_applications");

            migrationBuilder.DropColumn(
                name: "meeting_link",
                table: "job_applications");
        }
    }
}
