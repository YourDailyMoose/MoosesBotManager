const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { DateTime } = require('luxon');

let db;

async function connectDatabase(uri) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();
  db = client.db('moosesassistant');
}

function getDB() {
  return db;
}



async function getGuildBlacklistEntry(guildId) {
  try {
    const database = getDB();
    const collection = database.collection('guildblacklists');

    // Find the blacklist entry for the given guildId
    const blacklistEntry = await collection.findOne({ GuildId: guildId });

    return blacklistEntry;
  } catch (error) {
    console.error('Error retrieving guild blacklist entry:', error);
    throw error;
  }
}

async function addGuildBlacklist(guildId, moderator, reason, dateTime) {
  try {
    const collection = db.collection("guildblacklists");

    const existingEntry = await collection.findOne({ GuildId: guildId });

    if (!existingEntry) {
      await collection.insertOne({
        GuildId: guildId,
        Reason: reason,
        Moderator: moderator,
        DateTime: dateTime,
        Active: true
      });
      return "blacklisted";
    } else if (existingEntry.Active) {
      return "already_blacklisted";
    } else {
      await collection.updateOne(
        { GuildId: guildId },
        {
          $set: {
            Active: true,
            Reason: reason,
            Moderator: moderator,
            DateTime: dateTime
          }
        }
      );
      return "reactivated";
    }
  } catch (err) {
    console.error("Error blacklisting user:", err);
    return "error";
  }
}

async function unBlacklistGuild(guildId) {
  try {
    const collection = db.collection("guildblacklists");
    const query = { GuildId: guildId, Active: true };
    const update = { $set: { Active: false } };

    const result = await collection.updateOne(query, update);

    return result.modifiedCount > 0 ? 'unblacklisted' : 'not_blacklisted';
  } catch (error) {
    console.error("Error unblacklisting user:", error);
    return 'error';
  }
}

async function eraseGuildBlacklist(guildId) {
  try {
    const db = getDB()
    const collection = db.collection("guildblacklists");
    const result = await collection.deleteOne({ GuildId: guildId });
    return result.deletedCount > 0 ? 'erased' : 'not_found';
  } catch (error) {
    console.error("Error erasing blacklist:", error);
    return 'error';
  }
}


async function blacklistUser(userId, userTag, reason, moderator, dateTime) {
  try {
    const collection = db.collection("blacklists");

    const existingEntry = await collection.findOne({ UserId: userId });

    if (!existingEntry) {
      await collection.insertOne({
        UserId: userId,
        UserTag: userTag,
        Reason: reason,
        Moderator: moderator,
        DateTime: dateTime,
        Active: true
      });
      return "blacklisted";
    } else if (existingEntry.Active) {
      return "already_blacklisted";
    } else {
      await collection.updateOne(
        { UserId: userId },
        {
          $set: {
            Active: true,
            Reason: reason,
            Moderator: moderator,
            DateTime: dateTime
          }
        }
      );
      return "reactivated";
    }
  } catch (err) {
    console.error("Error blacklisting user:", err);
    return "error";
  }
}

async function unblacklistUser(userId) {
  try {
    const collection = db.collection("blacklists");
    const query = { UserId: userId, Active: true };
    const update = { $set: { Active: false } };

    const result = await collection.updateOne(query, update);

    return result.modifiedCount > 0 ? 'unblacklisted' : 'not_blacklisted';
  } catch (error) {
    console.error("Error unblacklisting user:", error);
    return 'error';
  }
}

async function eraseBlacklist(userId) {
  try {
    const collection = db.collection("blacklists");
    const result = await collection.deleteOne({ UserId: userId });
    return result.deletedCount > 0 ? 'erased' : 'not_found';
  } catch (error) {
    console.error("Error erasing blacklist:", error);
    return 'error';
  }
}

async function getBlacklistedUsers() {
  try {
    const collection = db.collection("blacklists");
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching blacklisted users:", error);
    throw error;
  }
}

async function getBlacklistedGuilds() {
  try {
    const collection = db.collection("guildblacklists");
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching blacklisted guilds:", error);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  getDB,
  addGuildBlacklist,
  unBlacklistGuild,
  eraseGuildBlacklist,
  blacklistUser,
  unblacklistUser,
  eraseBlacklist,
  getBlacklistedUsers,
  getBlacklistedGuilds,
};

