using Api.Models;

namespace Api.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> ListAsync();
        Task AddAsync(User user);
        Task AddAsync(IEnumerable<User> users);
        Task<User?> GetAsync(int id);
        Task<User?> GetAsync(string name, string world);
    }
}
