'use strict';
var React = window.React = require('react');

/* Stores */
var VariantStore = require('../../stores/VariantStore');

/* Utils */
var _ = require('lodash');
var toastr = require('toastr');
var copyTextToClipboard = require('../../utils/copyToClipboard.js');
var RestService = require('../../utils/RestService');
var Confirm = require('../utils/Confirm');
var Api = require('../../utils/Api');

/* Actions */
var AppActions = require('../../actions/AppActions');
//var VariantActions = require('../../actions/VariantActions');

/* Constants */
var UtilsConstants = require('../../constants/UtilsConstants');

/* React-bootstrap */
var ReactBoostrap = require('react-bootstrap');
var DropdownButton = ReactBoostrap.DropdownButton;
var Glyphicon = ReactBoostrap.Glyphicon;
var MenuItem = ReactBoostrap.MenuItem;
var Button = ReactBoostrap.Button;
var ButtonGroup = ReactBoostrap.ButtonGroup;
var Popover = ReactBoostrap.Popover;
var OverlayTrigger = ReactBoostrap.OverlayTrigger;
var Input = ReactBoostrap.Input;
var Dropdown = ReactBoostrap.Dropdown;

toastr.options = UtilsConstants.TOASTR_OPTIONS;


/**
 * 3 buttons to create a bookmark, return to one, and copy url to clipboard.
 **/
var Bookmarks = React.createClass({
    getInitialState: function() {
        return {
            bookmarks: VariantStore.getBookmarks(),
            goToLinksDisabled: false,  // to prevent the user from clicking many times on a bookmark
        };
    },
    componentDidMount: function() {
        VariantStore.addChangeListener(this._onBookmarksChange);
    },
    componentWillUnmount: function() {
        VariantStore.removeChangeListener(this._onBookmarksChange);
    },
    componentWillReceiveProps: function() {
        this.setState({goToLinksDisabled: false});
    },
    _onBookmarksChange: function() {
        this.setState({bookmarks: VariantStore.getBookmarks()});
    },

    /* Go to new bookmark: update stores, then trigger load variants */
    goTo: function(newQuery) {
        var query = this.props.query || {};
        var samplesChanged = ! _.isEqual(newQuery.samples, query.samples);  // lists
        var variantsChanged = newQuery.order_by !== query.order_by || newQuery.columns !== query.columns;
        var filtersChanged = ! _.isEqual(newQuery.filter, query.filter);  // lists
        if (samplesChanged || variantsChanged || filtersChanged) {
            this.setState({goToLinksDisabled: true});
            AppActions.goToBookmark(newQuery);  // update stores state, then load variants
        }
    },

    setBookmark: function(is_bookmark, text) {
        var query = JSON.stringify(Api.buildQueryDict());
        var timeMillis = Date.now();
        //var timestamp = new Date(timeMillis).toLocaleString();
        RestService.setBookmark(this.props.db, query, timeMillis, is_bookmark, text).then(function() {
            toastr.success("Bookmark saved");
        });
        var bookmarks = this.state.bookmarks;
        bookmarks.unshift({
            url: query,
            time: timeMillis,
            description: text,
        });
        this.setState({bookmarks: bookmarks});
    },

    deleteBookmark: function(bookmark) {
        var _this = this;
        Confirm.confirm("Delete bookmark "+bookmark.description+" ?").then(function() {
            RestService.deleteBookmark(_this.props.db, bookmark.time);
            var bookmarks = _this.state.bookmarks;
            _.remove(bookmarks, function(b) {return b.time === bookmark.time;});
            _this.setState({
                bookmarks: bookmarks,
                showConfirm: false,
            });
        });
    },

    render: function() {
        var _this = this;
        var bookmarkItems = _.map(this.state.bookmarks, function(bookmark, i) {
            //var timestamp = new Date(bookmark.time).toLocaleString();
            var url = JSON.parse(bookmark.url);
            var d = new Date(bookmark.time);
            var timestamp = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
                d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
            return (
                <MenuItem key={'bookmark-'+i} disabled={_this.state.goToLinksDisabled} onClick={_this.goTo.bind(null, url)}>
                    <div style={{display:'inline-block'}}>
                        <span className='bookmark-desc'>{bookmark.description + ' - ' + timestamp}</span>
                    </div>
                    <Button bsStyle='link' onClick={_this.deleteBookmark.bind(null, bookmark)}>
                        <Glyphicon glyph='remove' className={'remove-bookmark-button'} />
                    </Button>
                </MenuItem>
            );
        });

        var goToBookmarkPopover = <Popover id={'goto-bookmark-tooltip'}>Load bookmark</Popover>;
        var shareBookMark = <Popover id={'share-bookmark-tooltip'}>Copy URL to clipboard</Popover>;

        return (<span id='bookmark-buttons'>
            <ButtonGroup>
                <SaveBookmarkButton setBookmark={this.setBookmark} />
                <OverlayTrigger placement='top' overlay={goToBookmarkPopover}>
                    <DropdownButton title={<Glyphicon glyph='backward'/>} id='load-bookmark-button' bsStyle='primary' noCaret>
                        {bookmarkItems}
                    </DropdownButton>
                </OverlayTrigger>
                <OverlayTrigger placement='top' overlay={shareBookMark}>
                    <Button id='share-url-button' bsStyle='primary' noCaret
                        onClick={copyTextToClipboard.bind(null, window.location.href, "URL copied to cliboard")}>
                        <Glyphicon glyph='share-alt'/>
                    </Button>
                </OverlayTrigger>
            </ButtonGroup>
        </span>);
    },
});


/**
 * A Dropdown component with a text field and a 'save' button, to create a bookmark
 **/
var SaveBookmarkButton = React.createClass({
    getInitialState: function() {
        return {
            open: false,
            text: '',
        };
    },
    setBookmark: function(e) {
        if (e.type === 'keypress') {
            var keyCode = e.keyCode || e.which;
            if (keyCode !== 13){  // 'Enter' key
                return;
            }
        }
        this.props.setBookmark(true, this.state.text);
        this.refs.bookmarkDescriptionInput.refs.input.value = '';  // <Input/> = <div><input/></div>
        this.setState(this.getInitialState());
    },
    /* Called whenever a change is made to the <input> */
    onSelect: function(e, eventKey) {
        this.setState({
            open: eventKey !== 2,
            text: e.target.value,
        });
    },
    toggle: function() {
        this.setState({open: !this.state.open});
    },
    render: function() {
        var preventDefault = e => e.preventDefault();
        var addBookmarkPopover = <Popover id={'add-bookmark-tooltip'}>Save bookmark</Popover>;
        return (
            <OverlayTrigger placement='top' overlay={addBookmarkPopover}>
            <Dropdown id='save-bookmark-button' open={this.state.open} onToggle={this.toggle} onSelect={this.onSelect}>
                <Button bsRole='toggle' bsStyle='primary' onClick={preventDefault}>
                    <Glyphicon glyph='tag'/>
                </Button>
                <div bsRole='menu' className='dropdown-menu'>
                    <MenuItem eventKey={1}>
                        <Input type='text' ref='bookmarkDescriptionInput'
                            onChange={e => this.setState({text: e.target.value})}
                            onKeyPress={this.setBookmark}
                        />
                    </MenuItem>
                    <MenuItem eventKey={2}>
                        <Button block bsStyle='primary' onClick={this.setBookmark}>
                        {'Save'}
                        </Button>
                    </MenuItem>
                </div>
            </Dropdown>
            </OverlayTrigger>
        );
    },
});


module.exports = Bookmarks;
