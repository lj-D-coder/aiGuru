import { CounterModel } from "../models/apiCounterModel.js";

async function hitCounter(counterId) {
  var sequenceDocument = await CounterModel.findOneAndUpdate(
    { _id: counterId },
    { $inc: { hitCounter: 1 } },
    { new: true, upsert: true }
  );

  return sequenceDocument.hitCounter;
}

export default hitCounter;
