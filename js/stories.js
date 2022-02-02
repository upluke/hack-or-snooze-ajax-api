"use strict";

// js/stories.js contains code for UI about listing stories.


// This is the global list of the stories, an instance of StoryList
let storyList;
 
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  
  storyList = await StoryList.getStories();
  
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story,type ) {
  // console.debug("generateStoryMarkup", story);
 

  const hostName = story.getHostName();  
  const favoritesIdCollection=localStorage.getItem("favoritesIds")===null?[]:localStorage.getItem("favoritesIds") 
 
  // update trash icon and star icon depending on tab types
  let trashIconClass=''
  let starIconClass=''  
  const markedStar=favoritesIdCollection.indexOf(story.storyId)!==-1?'checked':''
  //|||||||||||||||||
  if(type==='favorites'){
    trashIconClass="fa fa-trash hidden"
    starIconClass=`fa fa-star ${markedStar}`
    
  }else if(type==='myStories'){
    trashIconClass="fa fa-trash"
    starIconClass=`fa fa-star ${markedStar}`
  }else{
    if(currentUser){
      trashIconClass="fa fa-trash hidden"
      starIconClass=`fa fa-star ${markedStar}`
    }else{
      trashIconClass="fa fa-trash hidden"
      starIconClass=`fa fa-star hidden`
    }
  }
 
  return $(`
      <li id="${story.storyId}">
        <span id="trash_id" data-story-id="${story.storyId}" class="${trashIconClass}"></span>
        <span id="star_id" data-story-id="${story.storyId}" class="${starIconClass}"></span> 
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  // console.debug("putStoriesOnPage");
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  
}


/** When a user click on submit a form displaces on the top of the list */
function navSubmitClick(evt){
    // console.debug("navSubmitClick");
    hidePageComponents()
    $storyForm.show()
    $("#story-title").val('') 
    $("#story-author").val('')
    $("#story-url").val('')
    $allStoriesList.show()
   
  }
 
$('#nav-submit').on('click', navSubmitClick)
  

/** When a user clicks sumbit button, a story will be added */

async function addNewStoryOnPage(evt){
 
  evt.preventDefault()
  
  const $storyTitle=$("#story-title").val()
  const $storyAuthor=$("#story-author").val()
  const $storyUrl=$("#story-url").val()
 
  
  const newStory= {'title': $storyTitle, 'author': $storyAuthor, 'url': $storyUrl}   
 
  const story=await storyList.addStory(currentUser, newStory)
 
  const  $story = generateStoryMarkup(story)
  
  $allStoriesList.append($story)
  
  $storyForm.hide() 
  putStoriesOnPage();  
}
   
$('#story-form').on('submit', addNewStoryOnPage)


/** add/remove fovirte to a story when star icon is clicked  */
async function addFavoriteStoryOnPage(evt){

  const token=currentUser.loginToken
  const username=currentUser.username
  const storyId=evt.target.dataset.storyId
  
  if ($(this).hasClass('checked')){
    await currentUser.removeAFavorite(token, username, storyId)
    $(this).removeClass('checked')
    
  }else{
    await currentUser.addAFavorite(token, username, storyId)
    $(this).addClass('checked')
    
  }
  addFavoritesOnPage()
   
}

$(document).on('click', '#star_id', addFavoriteStoryOnPage)

/** generate user's favorites on page */
async function addFavoritesOnPage(){

  $favoritesList.empty()
  if (!currentUser.favorites){
    $favoritesList.append("<p>No stories added by user yet</p>")
  }
  // const aUserData= await User.getAUserData(currentUser.username, currentUser.loginToken)
  // const favorites = aUserData.data.user.favorites
 
  for(let favorite of currentUser.favorites){
    const storifiedFavObject=new Story(favorite)
    const $favorite= generateStoryMarkup(storifiedFavObject, "favorites")
    
    $favoritesList.append($favorite)
  }

}

function displayFavorites(){
  hidePageComponents()
  $favoritesList.show()
}


$navFavorites.on('click', displayFavorites)



/** create user favrite list for look up*/

async function generateUserFavoriteList(){
  const aUserData=await User.getAUserData(currentUser.username, currentUser.loginToken)
  return aUserData.data.user.favorites.reduce((accu, curr)=>{
      accu.push(curr.storyId)
      return accu
   }, []) 
  
}

/** generate my stories */
async function addMyStoriesOnPage( ){
  $myStoriesList.empty()
 
  for(let userStory of currentUser.ownStories){
    const $myStories=generateStoryMarkup(userStory, "myStories")
    $myStoriesList.append($myStories)
  }
  
}

function displayMyStories(){
  hidePageComponents()
  $myStoriesList.show()
  addMyStoriesOnPage()
}

$navMyStories.on('click', displayMyStories )


/** delete a story */
async function deleteAStory(evt){
 
  const storyId=evt.target.dataset.storyId
  
  
  await storyList.removeAStory(storyId, currentUser)
  
  addMyStoriesOnPage()
}

$(document).on('click','#trash_id', deleteAStory)