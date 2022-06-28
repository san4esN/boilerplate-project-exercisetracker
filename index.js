import { nanoid } from 'nanoid'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
const app = express()

class Exercise{
  constructor(description,duration,date) {
    this.description = description;
    this.duration = duration;
    this.date = date;
  }
}
class User{
  constructor(name){
    this.name = name;
    this.exercises = [];
  }
}
let usersLogs = new Map
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static('public'))
/*app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});*/

//app.use('/public', express.static(`${process.cwd()}/public`));
app.all('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

function getUser(descr){
  for (const entry of usersLogs) {
    if(entry[0]===descr || entry[1].name === descr){
      //return [...new Map().set(entry[0],entry[1]).entries()][0];
      const deepCopy = JSON.parse(JSON.stringify(entry))
      return deepCopy
    }
  }
  return undefined;
  //return [...usersLogs.keys()].find((value)=>value.name === descr || value._id === descr)
}

app.post("/api/users",function(req,res){
  const name = req.body.username
  let user = getUser(name)
  if(typeof(user)==="undefined"){
    user = new User(name);
    const id = nanoid(15)
    usersLogs.set(id,user);
    user = getUser(id);
  }
  res.json({id:user[0], name:user[1].name});
})

app.get("/api/users",function(req,res){
  res.send([...usersLogs.entries()].map((user)=>({id:user[0], name:user[1].name})))
})

app.post("/api/users/:_id?/exercises",function(req,res){
  const userId = req.params._id;
  const description = req.body.description
  const duration = parseInt(req.body.duration)
  const date = req.body.date
  const newExercise = new Exercise(description,duration,date ? new Date(req.body.date) : new Date(Date.now()));
  const user = getUser(userId)
  user[1].exercises.push(newExercise)
  usersLogs.set(userId,user[1])
  res.json({
    name:user[1].name,
    _id:user[0],
    description:newExercise.description,
    duration:newExercise.duration,
    date:newExercise.date.toDateString()
  })
})

app.get("/api/users/:id/logs",function(req,res){
  const MIN_TIME_STAMP = -8640000000000000
  const MAX_TIME_STAMP = 8640000000000000
  const id = req.params.id;
  let user = getUser(id);
  const from = new Date(req.query.from || MIN_TIME_STAMP);
  const to = new Date(req.query.to || MAX_TIME_STAMP);
  const limit = parseInt(req.query.limit)|| Infinity;
  user = getUser(id);
  user[1].exercises = user[1].exercises.filter((value)=>(new Date(value.date)>=from && new Date(value.date)<=to))
  user[1].exercises = user[1].exercises.slice(0,limit)
  user[1].exercises = user[1].exercises.map((value)=>{
    value.date = new Date(value.date).toDateString()
    return value
  })
  res.json({_id:user[0],name:user[1].name,count:user[1].exercises.length, log:user[1].exercises})
})

/*app.get("/api/users/:id/logs",function(req,res){
  const id = req.params.id;
  const user = getUser(id);
  //filter
  res.json({_id:user[0],name:user[1].name,log:user[1].exercises})
})*/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
