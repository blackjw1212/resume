(function () {
  "use strict";

  var SECTION_ORDER = ["about", "experience", "education", "skills", "interests", "awards"];
  var SKILL_MARKS = {
    vehicle: "MOTO",
    wrench: "TOOL",
    iot: "IoT",
    windows: "WIN",
    macos: "MAC"
  };

  function bySelector(selector, root) {
    return (root || document).querySelector(selector);
  }

  function createElement(tagName, className, text) {
    var element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (typeof text === "string") {
      element.textContent = text;
    }

    return element;
  }

  function isSafeLocalPath(value) {
    return typeof value === "string" && value.length > 0 && !value.startsWith("//") && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
  }

  function isSafeUrl(value) {
    if (isSafeLocalPath(value)) {
      return true;
    }

    try {
      return new URL(value).protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  function setSafeHref(anchor, href) {
    if (!isSafeUrl(href)) {
      return false;
    }

    anchor.setAttribute("href", href);

    if (!isSafeLocalPath(href)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }

    return true;
  }

  function appendTitle(container, sectionId, title) {
    var heading = createElement("h2", null, title);
    heading.id = sectionId + "-title";
    container.appendChild(heading);
    return heading;
  }

  function replaceSection(sectionId, fragment) {
    var container = bySelector('[data-section="' + sectionId + '"]');

    if (!container) {
      return;
    }

    container.replaceChildren(fragment);
  }

  function renderAbout(section, profile) {
    var fragment = document.createDocumentFragment();
    var heading = createElement("h1");
    heading.id = "about-title";
    heading.appendChild(document.createTextNode(profile.name.family + " "));
    heading.appendChild(createElement("span", "accent-text", profile.name.given));
    fragment.appendChild(heading);

    var profileLine = createElement("div", "profile-line");
    profileLine.appendChild(document.createTextNode(profile.name.english));

    (profile.links || []).forEach(function (link) {
      var separator = createElement("span", null, "·");
      var anchor = createElement("a", null, link.label);

      if (setSafeHref(anchor, link.href)) {
        profileLine.appendChild(separator);
        profileLine.appendChild(anchor);
      }
    });

    fragment.appendChild(profileLine);

    var lead = createElement("div", "lead");
    (section.paragraphs || []).forEach(function (paragraph) {
      lead.appendChild(createElement("p", null, paragraph));
    });
    fragment.appendChild(lead);

    var socials = createElement("div", "social-links");
    (profile.links || []).forEach(function (link) {
      var anchor = createElement("a", "social-link", link.type === "github" ? "GitHub" : link.label);

      if (setSafeHref(anchor, link.href)) {
        anchor.setAttribute("aria-label", link.label);
        socials.appendChild(anchor);
      }
    });

    if (socials.childNodes.length > 0) {
      fragment.appendChild(socials);
    }

    replaceSection("about", fragment);
  }

  function renderResumeItems(sectionId, section) {
    var fragment = document.createDocumentFragment();
    appendTitle(fragment, sectionId, section.title);

    var list = createElement("div", "resume-list");
    (section.items || []).forEach(function (item) {
      var row = createElement("article", "resume-item");
      var content = createElement("div", "item-content");
      content.appendChild(createElement("h3", null, item.organization));
      content.appendChild(createElement("div", "item-role", item.role));
      content.appendChild(createElement("p", "item-description", item.description));
      row.appendChild(content);
      row.appendChild(createElement("div", "item-date", item.period));
      list.appendChild(row);
    });

    fragment.appendChild(list);
    replaceSection(sectionId, fragment);
  }

  function renderSkillIcons(items) {
    var list = createElement("ul", "skill-icons");

    (items || []).forEach(function (item) {
      if (!Object.prototype.hasOwnProperty.call(SKILL_MARKS, item.icon)) {
        return;
      }

      var entry = createElement("li", "skill-icon");
      var mark = createElement("span", "skill-mark", SKILL_MARKS[item.icon]);
      mark.setAttribute("aria-hidden", "true");
      entry.appendChild(mark);
      entry.appendChild(createElement("span", null, item.label));
      list.appendChild(entry);
    });

    return list;
  }

  function renderTextList(items, className) {
    var list = createElement("ul", className);
    (items || []).forEach(function (item) {
      list.appendChild(createElement("li", null, item));
    });
    return list;
  }

  function renderSkills(sectionId, section) {
    var fragment = document.createDocumentFragment();
    appendTitle(fragment, sectionId, section.title);

    (section.groups || []).forEach(function (group) {
      fragment.appendChild(createElement("div", "skill-group-title", group.title));

      if (group.type === "icons") {
        fragment.appendChild(renderSkillIcons(group.items));
      }

      if (group.type === "list") {
        fragment.appendChild(renderTextList(group.items, "plain-list"));
      }
    });

    replaceSection(sectionId, fragment);
  }

  function renderParagraphSection(sectionId, section) {
    var fragment = document.createDocumentFragment();
    appendTitle(fragment, sectionId, section.title);

    var wrapper = createElement("div", "lead");
    (section.paragraphs || []).forEach(function (paragraph) {
      wrapper.appendChild(createElement("p", null, paragraph));
    });

    fragment.appendChild(wrapper);
    replaceSection(sectionId, fragment);
  }

  function renderAwards(sectionId, section) {
    var fragment = document.createDocumentFragment();
    appendTitle(fragment, sectionId, section.title);
    fragment.appendChild(renderTextList(section.items, "award-list"));
    replaceSection(sectionId, fragment);
  }

  function renderResume(data) {
    var profile = data.profile;
    var sections = data.sections;

    document.title = profile.pageTitle;

    var metaDescription = bySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", profile.description);
    }

    var mobileName = bySelector("[data-profile-name]");
    if (mobileName) {
      mobileName.textContent = profile.name.display + "的履歷";
    }

    renderAbout(sections.about, profile);
    renderResumeItems("experience", sections.experience);
    renderResumeItems("education", sections.education);
    renderSkills("skills", sections.skills);
    renderParagraphSection("interests", sections.interests);
    renderAwards("awards", sections.awards);
  }

  function showLoadError() {
    var container = bySelector('[data-section="about"]');
    if (!container) {
      return;
    }

    container.replaceChildren(createElement("p", "error-note", "履歷資料暫時無法載入，請稍後再試。"));
  }

  function setupNavigation() {
    var nav = bySelector("#sideNav");
    var toggle = bySelector(".nav-toggle");
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var willOpen = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        if (nav && toggle) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          links.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      }, {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      });

      SECTION_ORDER.forEach(function (sectionId) {
        var section = document.getElementById(sectionId);
        if (section) {
          observer.observe(section);
        }
      });
    }
  }

  setupNavigation();

  fetch("data/resume.json", {
    cache: "no-store",
    credentials: "same-origin"
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Unable to load resume data");
      }
      return response.json();
    })
    .then(renderResume)
    .catch(showLoadError);
}());
