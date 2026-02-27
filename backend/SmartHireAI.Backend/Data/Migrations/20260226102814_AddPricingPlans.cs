using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHireAI.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "pricing_plan",
                table: "users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "usage_tracking",
                columns: table => new
                {
                    usage_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    feature_name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    usage_count = table.Column<int>(type: "int", nullable: false),
                    week_reset_date = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usage_tracking", x => x.usage_id);
                    table.ForeignKey(
                        name: "FK_usage_tracking_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_usage_tracking_user_id",
                table: "usage_tracking",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "usage_tracking");

            migrationBuilder.DropColumn(
                name: "pricing_plan",
                table: "users");
        }
    }
}
