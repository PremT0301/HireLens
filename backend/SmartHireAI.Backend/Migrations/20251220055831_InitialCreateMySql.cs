using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateMySql : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    email = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    full_name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    password_hash = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "applicants",
                columns: table => new
                {
                    applicant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    current_role = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    experience_years = table.Column<int>(type: "int", nullable: false),
                    location = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_applicants", x => x.applicant_id);
                    table.ForeignKey(
                        name: "FK_applicants_users_applicant_id",
                        column: x => x.applicant_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "recruiters",
                columns: table => new
                {
                    recruiter_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    company_name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recruiters", x => x.recruiter_id);
                    table.ForeignKey(
                        name: "FK_recruiters_users_recruiter_id",
                        column: x => x.recruiter_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resumes",
                columns: table => new
                {
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    applicant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    parsed_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    resume_health_score = table.Column<int>(type: "int", nullable: false),
                    resume_text = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resumes", x => x.resume_id);
                    table.ForeignKey(
                        name: "FK_resumes_applicants_applicant_id",
                        column: x => x.applicant_id,
                        principalTable: "applicants",
                        principalColumn: "applicant_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "job_descriptions",
                columns: table => new
                {
                    job_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    experience_required = table.Column<int>(type: "int", nullable: false),
                    recruiter_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    required_skills = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    salary_max = table.Column<int>(type: "int", nullable: false),
                    salary_min = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_descriptions", x => x.job_id);
                    table.ForeignKey(
                        name: "FK_job_descriptions_recruiters_recruiter_id",
                        column: x => x.recruiter_id,
                        principalTable: "recruiters",
                        principalColumn: "recruiter_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resume_embeddings",
                columns: table => new
                {
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    embedding = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resume_embeddings", x => x.resume_id);
                    table.ForeignKey(
                        name: "FK_resume_embeddings_resumes_resume_id",
                        column: x => x.resume_id,
                        principalTable: "resumes",
                        principalColumn: "resume_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resume_entities",
                columns: table => new
                {
                    entity_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    confidence = table.Column<float>(type: "float", nullable: false),
                    entity_type = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    entity_value = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resume_entities", x => x.entity_id);
                    table.ForeignKey(
                        name: "FK_resume_entities_resumes_resume_id",
                        column: x => x.resume_id,
                        principalTable: "resumes",
                        principalColumn: "resume_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "jd_embeddings",
                columns: table => new
                {
                    job_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    embedding = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jd_embeddings", x => x.job_id);
                    table.ForeignKey(
                        name: "FK_jd_embeddings_job_descriptions_job_id",
                        column: x => x.job_id,
                        principalTable: "job_descriptions",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "match_results",
                columns: table => new
                {
                    match_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    job_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    match_score = table.Column<float>(type: "float", nullable: false),
                    ranked_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_results", x => x.match_id);
                    table.ForeignKey(
                        name: "FK_match_results_job_descriptions_job_id",
                        column: x => x.job_id,
                        principalTable: "job_descriptions",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_match_results_resumes_resume_id",
                        column: x => x.resume_id,
                        principalTable: "resumes",
                        principalColumn: "resume_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_job_descriptions_recruiter_id",
                table: "job_descriptions",
                column: "recruiter_id");

            migrationBuilder.CreateIndex(
                name: "IX_match_results_job_id",
                table: "match_results",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "IX_match_results_resume_id",
                table: "match_results",
                column: "resume_id");

            migrationBuilder.CreateIndex(
                name: "IX_resume_entities_resume_id",
                table: "resume_entities",
                column: "resume_id");

            migrationBuilder.CreateIndex(
                name: "IX_resumes_applicant_id",
                table: "resumes",
                column: "applicant_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "jd_embeddings");

            migrationBuilder.DropTable(
                name: "match_results");

            migrationBuilder.DropTable(
                name: "resume_embeddings");

            migrationBuilder.DropTable(
                name: "resume_entities");

            migrationBuilder.DropTable(
                name: "job_descriptions");

            migrationBuilder.DropTable(
                name: "resumes");

            migrationBuilder.DropTable(
                name: "recruiters");

            migrationBuilder.DropTable(
                name: "applicants");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
