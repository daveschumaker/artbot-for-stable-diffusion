# \_\_local_db folder

In development environments, I want to be able to test various features related to server storage and databases. These files will be automatically added to the folder here.

`.gitignore` will ignore anything added to this folder using the following rule:

```git
# Ignore everything in the directory
/__local_db/*
# But do not ignore _README.md
!/__local_db/_README.md
```
