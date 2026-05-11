using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftBridge.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageServiceRequestRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_ReceiverId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_ServiceRequests_ServiceRequestId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ServiceRequestId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "ServiceRequestId",
                table: "Messages");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_RequestId",
                table: "Messages",
                column: "RequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_ReceiverId",
                table: "Messages",
                column: "ReceiverId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_ServiceRequests_RequestId",
                table: "Messages",
                column: "RequestId",
                principalTable: "ServiceRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_ReceiverId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_ServiceRequests_RequestId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_RequestId",
                table: "Messages");

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceRequestId",
                table: "Messages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ServiceRequestId",
                table: "Messages",
                column: "ServiceRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_ReceiverId",
                table: "Messages",
                column: "ReceiverId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_ServiceRequests_ServiceRequestId",
                table: "Messages",
                column: "ServiceRequestId",
                principalTable: "ServiceRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
