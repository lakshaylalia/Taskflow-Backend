import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({});

export const Ticket = mongoose.model("Ticket", ticketSchema);
