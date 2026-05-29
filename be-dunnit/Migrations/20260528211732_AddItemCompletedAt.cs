using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace be_dunnit.Migrations
{
    /// <inheritdoc />
    public partial class AddItemCompletedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CompletedAt",
                table: "Items",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Items");
        }
    }
}
