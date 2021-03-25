# 0.0.1

- Workspaces
  - Create named workspaces with multiple associated folders.
  - Sync to import file paths into DB.
  - View files associated with a workspace in a paginated list.
- Reworked DB access
  - The DB now runs on a worker thread. (hidden renderer window)
  - Queries to the DB now run over the network via Socket.io in a manner similar to IPC.

# 0.0.0

- Working example of MikroORM running on [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate).
