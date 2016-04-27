'use strict';
var React = require('react');

/* Components */
var FilterSummary = require('./FilterSummary');


/**
 * Represents one of the 'Scenario', 'Frequency' etc. accordion-opening panels
 * containing a group of filters, and the summary of the selection below.
 **/
var FilterGroup = React.createClass({
    render: function () {
        var group = this.props.group;
        var groupName = group.name;
        var isOpen = this.props.isOpen;
        var filters = this.props.filters;

        return (
            <div className={'panel panel-default link-panel nolink filter-group '+(isOpen?'open':'')}>
                <a role="button" data-toggle="collapse" data-parent="#filter-group-accordion"
                   href={'#filter-group-collapse-'+groupName}
                   aria-expanded={isOpen?'true':'false'}
                   aria-controls={'filter-group-collapse-'+groupName}
                >
                    <div className="panel-heading link-hover filter-group-head" role="tab" id={'filter-group-collapse-heading-'+groupName}>
                        <span className="panel-title">
                               <span className={'down-right'} aria-hidden="true"></span>
                               <strong>{groupName}</strong>
                        </span>
                    </div>
                </a>
                <div id={'filter-group-collapse-'+groupName}
                     className={'panel-collapse collapse'+(isOpen?' in':'')} role="tabpanel"
                     aria-labelledby={'filter-group-collapse-'+groupName}>
                    <div className="panel-body">
                        {filters}
                    </div>
                </div>
                <FilterSummary filters={group.filters}/>
            </div>
        );
    },
});


module.exports = FilterGroup;

