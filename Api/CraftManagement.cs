using Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Api
{
    public class CraftManagement
    {
        private readonly ILogger<CraftManagement> _logger;
        private readonly IUserService _userService;

        public CraftManagement(ILogger<CraftManagement> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [Function("ListUsers")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Admin, "get")] HttpRequest req)
        {
            var users = await _userService.ListAsync();
            return new OkObjectResult(users);
        }
    }
}
