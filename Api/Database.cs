using Dapper;
using Api.Constants;
using MySqlConnector;

namespace Api
{
    internal static class Database
    {
        internal static async Task PopulateAsync(MySqlConnection connection)
        {
            await connection.ExecuteAsync("CREATE DATABASE IF NOT EXISTS " + Data.NexusArcadeDatabaseName);

            var tableCreation = @"USE " + Data.NexusArcadeDatabaseName + @";
CREATE TABLE IF NOT EXISTS users
(
  id              INT unsigned NOT NULL AUTO_INCREMENT, # Unique ID for the record
  name            VARCHAR(150) NOT NULL,                # Name of the user
  world           VARCHAR(150) NOT NULL,                # World of the user
  PRIMARY KEY     (id)                                  # Make the id the primary key
);
CREATE TABLE IF NOT EXISTS requests
(
  id              INT unsigned NOT NULL AUTO_INCREMENT, # Unique ID for the record
  userId          INT unsigned NOT NULL,                # ID of the user it corresponds to
  requestTime     DateTime NOT NULL,					# The time at which the request was placed
  itemId          INT unsigned NOT NULL,                # ID of the item it corresponds to
  quantity        INT unsigned NOT NULL,                # Quantity of the item it corresponds to
  completedTime   DateTime NOT NULL,					# The time at which the request was completed
  PRIMARY KEY     (id),                                  # Make the id the primary key
  FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE
);";
            await connection.ExecuteAsync(tableCreation);
        }
    }
}
