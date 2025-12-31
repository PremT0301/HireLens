using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddJobSkillsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "assessment_required",
                table: "job_descriptions",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "assessment_type",
                table: "job_descriptions",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "experience_max",
                table: "job_descriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "experience_min",
                table: "job_descriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "growth_opportunities",
                table: "job_descriptions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "interview_mode",
                table: "job_descriptions",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "interview_rounds",
                table: "job_descriptions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "key_responsibilities",
                table: "job_descriptions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "perks_benefits",
                table: "job_descriptions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "role_overview",
                table: "job_descriptions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "technologies",
                table: "job_descriptions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "job_skills",
                columns: table => new
                {
                    skill_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    job_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    skill_name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    proficiency_level = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    weight = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_skills", x => x.skill_id);
                    table.ForeignKey(
                        name: "FK_job_skills_job_descriptions_job_id",
                        column: x => x.job_id,
                        principalTable: "job_descriptions",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_job_skills_job_id",
                table: "job_skills",
                column: "job_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_skills");

            migrationBuilder.DropColumn(
                name: "assessment_required",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "assessment_type",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "experience_max",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "experience_min",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "growth_opportunities",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "interview_mode",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "interview_rounds",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "key_responsibilities",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "perks_benefits",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "role_overview",
                table: "job_descriptions");

            migrationBuilder.DropColumn(
                name: "technologies",
                table: "job_descriptions");
        }
    }
}
