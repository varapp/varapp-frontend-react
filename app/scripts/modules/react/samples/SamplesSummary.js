'use strict';
var React = window.React = require('react');
var _ = require('lodash');

var SamplesStore = require('../../stores/SamplesStore');

var AuthenticatedComponent = require('../login/AuthenticatedComponent');

var ReactBoostrap = require('react-bootstrap');
var Panel = ReactBoostrap.Panel;

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;


/**
 * Show how many there are in total / affected / not affected.
 **/
var SamplesSummary = React.createClass({
    propTypes: {
        db: React.PropTypes.string,
    },
    getInitialState: function () {
        return {
            samples: SamplesStore.getSamplesCollection(),
        };
    },
    componentDidMount: function () {
        SamplesStore.addChangeListener(this._onDataChange);
    },
    componentWillUnmount: function () {
        SamplesStore.removeChangeListener(this._onDataChange);
    },
    _onDataChange: function () {
        this.setState({
            samples: SamplesStore.getSamplesCollection(),
        });
    },

    render: function () {
        /* Have to display the panel even if samples are not ready, because otherwise the window
           moves up and down on changes as the component disappears/reappears. */
        var family;
        var summary = {};
        var samples = this.state.samples;
        if (samples) {
            summary = samples.summary();
            var families = _.uniq(_.map(samples.getActiveSamples(), 'family_id'));
            switch (families.length) {
                case 0: family = null; break;
                case 1: family = families[0]; break;
                default: family = families.sort()[0] + ',…'; break;
            }
        }
        var total = summary.total === undefined ? '?' : summary.total;
        var affected = summary.affected === undefined ? '0' : summary.affected;
        var not_affected = summary.not_affected === undefined ? '0' : summary.not_affected;
        return (
            <div id='samples-summary' className='nolink'>
            <Link to='/samples'>
            <Panel className='link-hover link-panel summary-panel'>
                <span>
                    <span className="panel-title"><span className='down-right' />
                        <strong>Samples selection<i>{family ? ' ('+family+') ' : ''}</i>:</strong>
                    </span>
                    <span className='samples-summary'>
                        Total: <span className="badge">{total}</span>
                    </span>
                    <span className='samples-summary'>
                        Not affected: <span className="badge sample_group sample_group_not_affected">{not_affected}</span>
                    </span>
                    <span className='samples-summary'>
                        Affected: <span className="badge sample_group sample_group_affected">{affected}</span>
                    </span>
                </span>
            </Panel>
            </Link>
            </div>
        );
    },
});


module.exports = AuthenticatedComponent(SamplesSummary);
