# The theme of this project
## Against "the deth of the company equales to the deth of application"
- If the company wich offers the blog service went bankrupt, all data of the blog may be gone forver. So we can not write the important things in the internet. 
- But on the other hands, if the application was managed by the real DAO, we might be able to save the application & the data.
- That's why I aim to implement DAO layer under the application.
- I call this application "DAO Oriented Protocol(DOP)". 
# Core compornents
## "Application core"
- Overview
  - "Application core" offers to manage another components.
  - DOP can be added any functions & these functions should be managed by DAO.
- Functions
  - Get application list
    - This function offers to get all application lists including preinstall.
    - DOP has specific application which consists of the main functions of DAO. These are "Member manager", "Proposal manager" & "Vote manager". These applications can be updated but they can not be deleted.
  - Install application
    - This function offers to install the application which is allowed by voting of DAO members.
  - Delete application
    - This function offers to delete the application.
    - If the application was deleted, DOP never manage the application.
## "Member manager(Preinstall)"
- Overview
  - This application offers to manage members of DAO.
- Functions
  - Get member list
    - This function offers to list all members of DAO.
  - Add member
    - This function offers to add the member.
    - The adding member must be proposed & allowed by voting of DAO members.
  - Delete member
    - This function offers to delete the member.
    - The deleting member must be proposed & allowed by voting  
## "Proposal manager(Preinstall)"
- Overview
  - This application offers to manage the proposals of DAO.
- Functions
  - Get proposal list
    - This function offers to list all proposals of DAO.
    - People can check the status of each proposal.
  - Submit a proposal
    - This function offers that DAO members can submit a proposal to take an action for DAO.
    - All actions for DAO must be proposed by using this function.
  - Execute a proposal
    - This function offers to execute the proposal which is allowed by voting of DAO members.
## "Vote manager(Preinstall)"
- Overview
  - This application offers to manage the voting of proposals.
- Functions
  - Get voting list
    - This function offers to list all voting.
    - People can check voting result of each proposal.
  - Change voting parameters
    - This function offers to change the threshold of passing the vote & etc.
  - Change the status of voting
    - This function offers to manage the status of voting.
  - Vote
    - This function offers to vote by DAO members.
