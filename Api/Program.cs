using Api;
using Api.Constants;
using Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MySqlConnector;

const string serverConnectionKey = "server";

var builder = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((hostContext, services) =>
    {
        var defaultSqlConn = hostContext.Configuration.GetConnectionString("Default")!;
        var ApiSqlConn = defaultSqlConn + "; Database=" + Data.NexusArcadeDatabaseName;
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        services.AddMySqlDataSource(ApiSqlConn);
        services.AddKeyedMySqlDataSource(serverConnectionKey, defaultSqlConn);
        services.AddTransient<IUserService, UserService>();
        services.AddTransient<IItemService, ItemService>();
    });

var host = builder
    .Build();

await Database.PopulateAsync(host.Services.GetRequiredKeyedService<MySqlConnection>(serverConnectionKey));

host.Run();
