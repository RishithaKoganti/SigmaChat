import express from "express"
import Thread from "../models/Thread.js"
import getOpenAIAPIResponse from "../utils/openai.js"
import auth from "../middleware/auth.js"

const router = express.Router();

//get all the threads
router.get("/thread", auth, async(req,res)=>{
    try{
        const threads = await Thread.find({ userId: req.user.id }).sort({updatedAt: -1});
        res.send(threads);
    }catch(err){
        console.log(err);
        res.status(500).send("Server Error");
    }
});

//thread based on threadId
router.get("/thread/:threadId", auth, async(req,res)=>{
    const {threadId} = req.params;
    try{
        const thread = await Thread.findOne({ threadId, userId: req.user.id });
        if(!thread){
            return res.status(404).json({error : "Thread is not found"});
        }
        res.send(thread.messages);
    }catch(err){
        console.log(err);
        res.status(500).send("Server Error");
    }
});

//deleting a thread
router.delete("/thread/:threadId", auth, async(req,res)=>{
    const {threadId} = req.params;
    try{
        const deletedthread = await Thread.findOneAndDelete({ threadId, userId: req.user.id });
        if(!deletedthread){
            return res.send("No such thread exisits");
        }
        res.status(200).json({success : "Thread deleted succesfully"});
    }catch(err){
        console.log(err);
        res.status(500).send("Server Error");
    }
})

// message storing 
router.post("/chat", auth, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }
  try {
    let thread = await Thread.findOne({ threadId, userId: req.user.id });
    if (!thread) {
      thread = new Thread({
        threadId,
        userId: req.user.id,
        title: message,
        messages: [{ role: "user", content: message }]
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }
    const assistantReply = await getOpenAIAPIResponse(message);
    thread.messages.push({
      role: "assistant",
      content: assistantReply
    });
    thread.updatedAt = new Date();
    await thread.save();
    res.json({ reply: assistantReply });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;