import { Document, Schema, model } from 'mongoose';

export interface IScore extends Document {
    score_anime: Number,
    score_manga: Number,
    score_movie: Number,
    score_book: Number,
    score_vn: Number,
    score_listening: Number,
    score_reading: Number,
    score_readingtime: Number,
}

const ScoreSchema = new Schema<IScore>({
    score_anime: {
      type: Number,
      required: true
    },
    score_manga: {
        type: Number,
        required: true
    },
    score_movie: {
      type: Number,
      required: true
    },
    score_book: {
        type: Number,
        required: true
    },
    score_vn: {
        type: Number,
        required: true
    },
    score_listening: {
        type: Number,
        required: true
    },
    score_reading: {
        type: Number,
        required: true
    },
    score_readingtime: {
        type: Number,
        required: true
    },
});

export const ScoreModel = model<IScore>("Score", ScoreSchema);
