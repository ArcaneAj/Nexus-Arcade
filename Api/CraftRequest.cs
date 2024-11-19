using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FromBodyAttribute = Microsoft.Azure.Functions.Worker.Http.FromBodyAttribute;

namespace Api
{
    public class CraftRequest
    {
        private readonly ILogger<CraftRequest> _logger;
        private readonly IUserService _userService;
        private readonly IItemService _itemService;

        public CraftRequest(ILogger<CraftRequest> logger, IUserService userService, IItemService itemService)
        {
            _logger = logger;
            _userService = userService;
            _itemService = itemService;
        }

        [Function("List")]
        public async Task<IActionResult> List([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req, [FromBody] User user)
        {
            var existingUser = await _userService.GetAsync(user.Name, user.World);
            if (existingUser == null)
            {
                return new OkObjectResult(new List<ItemCraftRequest>());
            }

            var existingRequests = await _itemService.ListAsync(existingUser);

            return new OkObjectResult(existingRequests);
        }

        [Function("Add")]
        public async Task<IActionResult> Add([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req, [FromBody] UserCraftRequest craftRequest)
        {
            var existingUser = await _userService.GetAsync(craftRequest.User.Name, craftRequest.User.World);
            if (existingUser == null)
            {
                await _userService.AddAsync(craftRequest.User);
                existingUser = await _userService.GetAsync(craftRequest.User.Name, craftRequest.User.World);

                if (existingUser == null)
                {
                    return new BadRequestObjectResult("Error occurred between adding new user and querying it.");
                }
            }

            foreach (var item in craftRequest.ItemCrafts) {
                item.UserId = existingUser.Id;
                item.RequestTime = DateTime.UtcNow;
                item.CompletedTime = DateTime.MaxValue.AddDays(-1);
            }

            await _itemService.AddAsync(craftRequest.ItemCrafts);

            var existingRequests = await _itemService.ListAsync(existingUser);

            return new OkObjectResult(existingRequests);
        }

        [Function("Delete")]
        public async Task<IActionResult> Delete([HttpTrigger(AuthorizationLevel.Function, "delete")] HttpRequest req, [FromBody] UserCraftRequest craftRequest)
        {
            var existingUser = await _userService.GetAsync(craftRequest.User.Name, craftRequest.User.World);
            if (existingUser == null)
            {
                return new BadRequestObjectResult("User does not exist.");
            }

            var existingRequests = await _itemService.ListAsync(existingUser);

            var requestedIds = craftRequest.ItemCrafts.Select(c => c.Id).ToList();

            var toDelete = existingRequests.Where(x => requestedIds.Contains(x.Id));

            await _itemService.DeleteAsync(toDelete);

            return new OkObjectResult(existingRequests);
        }
    }
}
