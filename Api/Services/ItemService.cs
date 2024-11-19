using Dapper;
using Api.Models;
using MySqlConnector;
using Z.Dapper.Plus;
using Azure.Core;

namespace Api.Services
{
    public class ItemService : IItemService
    {
        private readonly MySqlConnection _connection;
        public ItemService(MySqlConnection connection)
        {
            _connection = connection;
        }
        public async Task AddAsync(ItemCraftRequest request)
        {
            await AddAsync([request]);
        }

        public async Task AddAsync(IEnumerable<ItemCraftRequest> requests)
        {
            await _connection.UseBulkOptions(x => x.DestinationTableName = "requests").BulkInsertAsync(requests);
        }

        public async Task DeleteAsync(int id)
        {
            await _connection.ExecuteAsync("DELETE FROM requests WHERE id = @id", new { id });
        }

        public async Task DeleteAsync(IEnumerable<ItemCraftRequest> toDelete)
        {
            await _connection.UseBulkOptions(x => x.DestinationTableName = "requests").BulkDeleteAsync(toDelete);
        }

        public async Task<IEnumerable<ItemCraftRequest>> ListAsync()
        {
            return await _connection.QueryAsync<ItemCraftRequest>("SELECT * FROM requests");
        }

        public async Task<IEnumerable<ItemCraftRequest>> ListAsync(User user)
        {
            return await _connection.QueryAsync<ItemCraftRequest>("SELECT * FROM requests WHERE userId = @userId", new { userId = user.Id });
        }
    }
}
