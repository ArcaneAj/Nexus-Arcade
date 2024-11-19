namespace Api.Models
{
    public record UserCraftRequest
    {
        public required User User { get; set; }
        public required IEnumerable<ItemCraftRequest> ItemCrafts { get; set; }
    }
}
