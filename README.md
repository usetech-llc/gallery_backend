# gallery_backend

| Method | Descreption |
|--|--|
| `/health`  | checks whether there is a connection to the blockchain |
| `/mint` | uploading images to the blockchain |
| `/metadata/:id` | output of the image url |
| `/config` | getting the protocol configuration |
| `/whoam` | what kind of service are you |



### config.js

| Attributes | Descreption |
|--|--|
| host | the host from which we request images, it can be found through the method a `/whoam` |
| protocol | `http` or `https` |

```json
[
  {
    "host":"localhost:3003",
    "protocol":"https"
  },
  {
    ....
  },
  {
    ...
  }
]
```