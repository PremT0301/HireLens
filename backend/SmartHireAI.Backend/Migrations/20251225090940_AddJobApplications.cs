using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddJobApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ats_feedback",
                table: "resumes");

            migrationBuilder.DropColumn(
                name: "ats_score",
                table: "resumes");

            migrationBuilder.DropColumn(
                name: "final_ranking_score",
                table: "match_results");

            migrationBuilder.DropColumn(
                name: "suitability_label",
                table: "match_results");

            migrationBuilder.CreateTable(
                name: "job_applications",
                columns: table => new
                {
                    application_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    job_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    applicant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    applied_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ats_score = table.Column<float>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_applications", x => x.application_id);
                    table.ForeignKey(
                        name: "FK_job_applications_applicants_applicant_id",
                        column: x => x.applicant_id,
                        principalTable: "applicants",
                        principalColumn: "applicant_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_job_applications_job_descriptions_job_id",
                        column: x => x.job_id,
                        principalTable: "job_descriptions",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_job_applications_applicant_id",
                table: "job_applications",
                column: "applicant_id");

            migrationBuilder.CreateIndex(
                name: "IX_job_applications_job_id",
                table: "job_applications",
                column: "job_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_applications");

            migrationBuilder.AddColumn<string>(
                name: "ats_feedback",
                table: "resumes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ats_score",
                table: "resumes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<float>(
                name: "final_ranking_score",
                table: "match_results",
                type: "float",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<string>(
                name: "suitability_label",
                table: "match_results",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
