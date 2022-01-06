import { Document, Schema, model } from 'mongoose';

export interface ILog extends Document {
    discord_guild_id: String,
    discord_user_id: String,
    type_activity: String,
    create_at: Date,
    amount: Number,
    details: String
}

const LogSchema = new Schema<ILog>({
    discord_guild_id: {
      type: String,
      required: true
    },
    discord_user_id: {
      type: String,
      required: true
    },
    type_activity: {
      type: String,
      required: true
    },
    create_at: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    details: {
      type: String,
      required: true
    },
  });

export const LogModel = model<ILog>("Log", LogSchema);
