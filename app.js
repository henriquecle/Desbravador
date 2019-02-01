const dataController = (() => {
  let user = {
    name: '',
    avatar: '',
    followers: '',
    following: '',
    email: '',
    bio: '' 
  };

  let repos = [];

  let repoDetails = {
    name: '',
    description: '',
    stars: '',
    language: '',
    link: ''
  };

  return {
    getUser: () => user,
    getRepos: () => repos,
    getRepoDetails: () => repoDetails,
    updateUser: (data) => {
      user = {
        name: data.name,
        avatar: data.avatar_url,
        followers: data.followers,
        following: data.following,
        email: data.email,
        bio: data.bio 
      }
    },
    updateRepos: (data) => {
      repos = data.map( repo => {
        return {
          name: repo.name,
          stars: repo.stargazers_count
        }
      })
    },
    updateRepoDetails: (data) => {
      repoDetails = {
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        language: data.language,
        link: data.html_url
      }
    }
  }
})();


const UIController = (() => {
  const elements = {
    btnSearch: document.querySelector('.search-button'),
    searchBox: document.querySelector('.search-box'),
    userName: document.querySelector('.user-name'),
    userAvatar: document.querySelector('.user-avatar'),
    userFollowers: document.querySelector('.user-followers'),
    userFollowing: document.querySelector('.user-following'),
    userEmail: document.querySelector('.user-email'),
    userBio: document.querySelector('.user-bio'),
    userRepos: document.querySelector('.user-repos'),
    repoName: document.querySelector('.repo-name'),
    repoDescription: document.querySelector('.repo-description'),
    repoStars: document.querySelector('.repo-stars'),
    repoLanguage: document.querySelector('.repo-language'),
    repoLink: document.querySelector('.repo-link'),
    btnSortRepos: document.querySelector('.sort-repo')
  };

  const updateUsr = (user) => {
    elements.userName.textContent = user.name;
    elements.userAvatar.src = user.avatar;
    elements.userFollowers.textContent = `Seguidores: ${user.followers}`;
    elements.userFollowing.textContent = `Seguindo: ${user.following}`;
    elements.userEmail.textContent = `Email: ${user.email === null ? "não possui" : user.bio}`;
    elements.userBio.textContent = `Bio: ${user.bio === null ? "não possui" : user.bio}`;
  };

  let sortPosition = 'up';

  const updateRps = (repos) => {
    elements.userRepos.innerHTML = "";

    if (sortPosition === 'up') {
      repos.sort((a, b) => (
        +(a.stars < b.stars) || +(a.stars === b.stars) - 1
      ))
      .forEach( repo => {
        let el = document.createElement('div');
        el.classList.add('user-repo');
        let txt = document.createTextNode('Nome: ' + repo.name + ' | Estrelas: ' + repo.stars);
        el.appendChild(txt);
        elements.userRepos.appendChild(el);
      })     
    } else if(sortPosition === 'down') {
      repos.sort((a, b) => (
          +(a.stars > b.stars) || +(a.stars === b.stars) - 1
      ))
      .forEach( repo => {
        let el = document.createElement('div');
        el.classList.add('user-repo');
        let txt = document.createTextNode('Nome: ' + repo.name + ' | Estrelas: ' + repo.stars);
        el.appendChild(txt);
        elements.userRepos.appendChild(el);
      })
    }
  };

  const updateRpDetails = (repoDetails) => {
    elements.repoName.textContent = `Nome: ${repoDetails.name}`;
    elements.repoDescription.textContent = `Descrição: ${repoDetails.description === null ? 
      'não possui' : repoDetails.description}`;
    elements.repoStars.textContent = `Estrelas: ${repoDetails.stars}`;
    elements.repoLanguage.textContent = `Linguagem: ${repoDetails.language}`;
    elements.repoLink.textContent = `Link: ${repoDetails.link}`;
  }

  const changeSortPosition = (repos) => {
    if (sortPosition === 'up') {
      sortPosition = 'down';
    } else {
      sortPosition = 'up';
    }

    updateRps(repos);
  };

  return {
    getElements: () => elements,
    updateUser: (user) => {
      updateUsr(user);
    },
    updateRepos: (repos) => {
      updateRps(repos);
    },
    updateRepoDetails: (repoDetails) => {
      updateRpDetails(repoDetails);
    },
    sortRepos: (repos) => {
      changeSortPosition(repos);
    }
  }
})();


const globalController = ((dataCtrl, UICtrl) => {
  const urlUser = 'https://api.github.com/users/';
  const urlUserRepos = 'https://api.github.com/users/{username}/repos';
  const urlRepoDetails = 'https://api.github.com/repos/{full_name}';
  const elements = UICtrl.getElements();

  const setupEventListeners = () => {
    elements.btnSearch.addEventListener("click", search);
    elements.btnSortRepos.addEventListener("click", sortRepos);
  };

  const setupEventListenersUserRepos = () => {
    const repos = document.querySelectorAll('.user-repo');
    repos.forEach( repo => {
      const text = repo.textContent;
      repo.addEventListener('click', () => {searchRepo(text.slice(6, text.indexOf("|") - 1))});
    })
  };

  const search = () => {
    const searchBoxText = elements.searchBox.value;
    
    fetch(`${urlUser}${searchBoxText}`)
      .then(response => {
        response.json().then( data => {
          dataCtrl.updateUser(data);
          UICtrl.updateUser(dataCtrl.getUser());
        })
      })
      .catch(() => {
        console.log('Error');
      });

    fetch(urlUserRepos.replace('{username}', searchBoxText))
      .then(response => {
        response.json().then( data => {
          dataCtrl.updateRepos(data);
          UICtrl.updateRepos(dataCtrl.getRepos());
          setupEventListenersUserRepos();
        })
      })
      .catch(() => {
        console.log('Error');
      });
  };

  const searchRepo = (repoName) => {
    fetch(urlRepoDetails.replace('{full_name}', `${elements.searchBox.value}/${repoName}`))
      .then(response => {
        response.json().then( data => {
          dataCtrl.updateRepoDetails(data);
          UICtrl.updateRepoDetails(dataCtrl.getRepoDetails());
        })
      })
      .catch(() => {
        console.log('Error');
      });
  };

  const sortRepos = () => {
    UIController.sortRepos(dataCtrl.getRepos());
    setupEventListenersUserRepos();
  };

  return {
    init: () => {
      setupEventListeners();
    }
  };
})(dataController, UIController);


globalController.init();