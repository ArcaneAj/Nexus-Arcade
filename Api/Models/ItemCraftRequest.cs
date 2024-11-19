namespace Api.Models
{
    public record ItemCraftRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ItemId { get; set; }
        public int Quantity { get; set; }
        public DateTime RequestTime { get; set; }
        public DateTime CompletedTime { get; set; }
    }
}
