using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddEducationAndWorkExperience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "completion_year",
                table: "applicants");

            migrationBuilder.DropColumn(
                name: "grade",
                table: "applicants");

            migrationBuilder.RenameColumn(
                name: "college_name",
                table: "applicants",
                newName: "address");

            migrationBuilder.AddColumn<string>(
                name: "resume_url",
                table: "applicants",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "application_messages",
                columns: table => new
                {
                    message_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    application_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    sender_role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    subject = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    body = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sent_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_application_messages", x => x.message_id);
                    table.ForeignKey(
                        name: "FK_application_messages_job_applications_application_id",
                        column: x => x.application_id,
                        principalTable: "job_applications",
                        principalColumn: "application_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "education",
                columns: table => new
                {
                    education_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    applicant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    college_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    degree = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    specialization = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    completion_year = table.Column<int>(type: "int", nullable: false),
                    grade = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_education", x => x.education_id);
                    table.ForeignKey(
                        name: "FK_education_applicants_applicant_id",
                        column: x => x.applicant_id,
                        principalTable: "applicants",
                        principalColumn: "applicant_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "work_experience",
                columns: table => new
                {
                    experience_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    applicant_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    company_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    role = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    duration = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_experience", x => x.experience_id);
                    table.ForeignKey(
                        name: "FK_work_experience_applicants_applicant_id",
                        column: x => x.applicant_id,
                        principalTable: "applicants",
                        principalColumn: "applicant_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_application_messages_application_id",
                table: "application_messages",
                column: "application_id");

            migrationBuilder.CreateIndex(
                name: "IX_education_applicant_id",
                table: "education",
                column: "applicant_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_experience_applicant_id",
                table: "work_experience",
                column: "applicant_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "application_messages");

            migrationBuilder.DropTable(
                name: "education");

            migrationBuilder.DropTable(
                name: "work_experience");

            migrationBuilder.DropColumn(
                name: "resume_url",
                table: "applicants");

            migrationBuilder.RenameColumn(
                name: "address",
                table: "applicants",
                newName: "college_name");

            migrationBuilder.AddColumn<int>(
                name: "completion_year",
                table: "applicants",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "grade",
                table: "applicants",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
