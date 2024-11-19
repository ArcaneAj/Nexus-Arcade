using Dapper;
using Api.Models;
using MySqlConnector;

namespace Api.Services
{
    public class UserService : IUserService
    {
        private readonly MySqlConnection _connection;
        public UserService(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task AddAsync(User user)
        {
            await AddAsync([user]);
        }

        public async Task AddAsync(IEnumerable<User> users)
        {
            var count = await _connection.ExecuteAsync(@"INSERT INTO users (name, world) values (@Name, @World)", users);
        }

        public async Task<User?> GetAsync(int id)
        {
            return await _connection.QuerySingleOrDefaultAsync<User>("SELECT * FROM users WHERE id = @id", new { id });
        }

        public async Task<User?> GetAsync(string name, string world)
        {
            return await _connection.QuerySingleOrDefaultAsync<User>("SELECT * FROM users WHERE name = @name AND world = @world", new { name, world });
        }

        public async Task<IEnumerable<User>> ListAsync()
        {
            return await _connection.QueryAsync<User>("SELECT * from users");
        }
    }
}
