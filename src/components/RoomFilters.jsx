function RoomFilters({ filters, roomTypes, onChange, onClear }) {
  const handleInput = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <section className="filters-panel">
      <h3>Filters</h3>
      <div className="filters-grid">
        <label>
          Search Room Number
          <input
            name="search"
            placeholder="e.g. 101"
            value={filters.search}
            onChange={handleInput}
          />
        </label>
        <label>
          Status
          <select name="status" value={filters.status} onChange={handleInput}>
            <option value="">All</option>
            <option value="available">available</option>
            <option value="occupied">occupied</option>
            <option value="maintenance">maintenance</option>
          </select>
        </label>
        <label>
          Room Type
          <select name="room_type_id" value={filters.room_type_id} onChange={handleInput}>
            <option value="">All</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min Price
          <input
            name="min_price"
            type="number"
            min="0"
            step="0.01"
            value={filters.min_price}
            onChange={handleInput}
          />
        </label>
        <label>
          Max Price
          <input
            name="max_price"
            type="number"
            min="0"
            step="0.01"
            value={filters.max_price}
            onChange={handleInput}
          />
        </label>
        <label>
          Min Capacity
          <input
            name="capacity"
            type="number"
            min="1"
            value={filters.capacity}
            onChange={handleInput}
          />
        </label>
      </div>
      <button type="button" className="btn btn-secondary" onClick={onClear}>
        Clear Filters
      </button>
    </section>
  );
}

export default RoomFilters;