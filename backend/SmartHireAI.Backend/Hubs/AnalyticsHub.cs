using Microsoft.AspNetCore.SignalR;

namespace SmartHireAI.Backend.Hubs
{
    public class AnalyticsHub : Hub
    {
        // Clients can join specific groups if needed, e.g. "Admins"
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        public async Task LeaveAdminGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
        }
    }
}
