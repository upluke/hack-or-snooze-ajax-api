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

function generateStoryMarkup(story,showDeleteBtn = false ) {
 
  const showStar = Boolean(currentUser); 

  const hostName = story.getHostName();  
  
 
 
  const getDeleteBtnHTML=`
      <span id="trash_id" data-story-id="${story.storyId}" class="fa fa-trash" >
       
      </span>`
  let getStarHTML=`<span id="star_id" data-story-id="${story.storyId}" class="fa fa-star">
        
      </span>`
  if (showStar){
  const isFavorite = currentUser.isFavorite(story);
  const checked = isFavorite ? "checked" : "";
  getStarHTML=`
      <span id="star_id" data-story-id="${story.storyId}" class="fa fa-star ${checked}">
        
      </span>`
  }
      
      
  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtnHTML: ""}
        ${showStar ? getStarHTML : ""}
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
async function toggleStoryFavorite(event){
  
  const token=currentUser.loginToken
  const username=currentUser.username
  const storyId=event.target.dataset.storyId
  const story=storyList.stories.find(story=>story.storyId===storyId)
  
  if ($(event.target).hasClass('checked')){
    console.log("in 1")
    $(event.target).removeClass('checked')
   await currentUser.removeAFavorite(token, username, storyId, currentUser)
    
    
  }else{
    console.log("in 2")
    $(event.target).addClass('checked')
    console.log($(event.target).hasClass('checked'), "^^^^^^^^^^^")
   await currentUser.addAFavorite(token, username, storyId, currentUser, story)
   
   
  }
  console.log($(event.target).hasClass('checked'), "^^^^^--^^^^^^")
  console.log()
  addFavoritesOnPage()
   
}

//make star icons clickable in all lists
$allStoriesList.add($favoritesList).add($myStoriesList).on('click', '#star_id', toggleStoryFavorite)

/** generate user's favorites on page */
async function addFavoritesOnPage(){

  $favoritesList.empty()
  if (currentUser.favorites.length<1){
    $favoritesList.append("<p>No stories added by user yet</p>")
  }
 
  for(let favorite of currentUser.favorites){
    const $favorite= generateStoryMarkup(favorite)
    
    $favoritesList.append($favorite)
  }

}

function displayFavorites(){
  hidePageComponents()
  $favoritesList.show()
}

$navFavorites.on('click', displayFavorites)


 

/** generate my stories */
async function addMyStoriesOnPage( ){
  $myStoriesList.empty()
  
  if(currentUser.ownStories.length<1){
    $myStoriesList.append('<p>No stories added by user yet</p>')
  }

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
  console.log("in delete")
  const storyId=evt.target.dataset.storyId
  await storyList.removeAStory(storyId, currentUser)
  
  addMyStoriesOnPage()
}

$myStoriesList.on('click','#trash_id', deleteAStory)



// Notes:

// 1. class methods with static keyword can be accessed by class property even   
// 2. what's the purpose of using static
 