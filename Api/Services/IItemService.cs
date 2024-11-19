using Api.Models;

namespace Api.Services
{
    public interface IItemService
    {
        Task<IEnumerable<ItemCraftRequest>> ListAsync();
        Task<IEnumerable<ItemCraftRequest>> ListAsync(User user);
        Task AddAsync(ItemCraftRequest request);
        Task AddAsync(IEnumerable<ItemCraftRequest> requests);
        Task DeleteAsync(int id);
        Task DeleteAsync(IEnumerable<ItemCraftRequest> toDelete);
    }
}
